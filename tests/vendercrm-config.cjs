// Synthetic handler/config checks; PHP -n disables real cURL.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),php=process.env.PHP_BINARY||'php';
const temp=fs.mkdtempSync(path.join(process.env.VENDERCRM_TEST_TMP||os.tmpdir(),'gruas-config-'));
const canonical={VENDERCRM_URL:'https://crm.example.com',VENDERCRM_API_KEY:'synthetic-fixture'};
function configFile(value){return '<?php echo "suppressed-fixture-output"; return '+JSON.stringify(value).replace(/^\{/,'[').replace(/\}$/,']').replace(/"([^"]+)":/g,'"$1"=>')+';';}
const cases=[
 ['unconfigured',null,{},null,false,0],['missing-helper',canonical,{},null,false,0],['private-no-curl',canonical,{},null,false,0],
 ['private-success',canonical,{},'success',true,1],['init-false',canonical,{},'init-false',false,1],
 ['exec-false',canonical,{},'exec-false',false,1],['init-throw',canonical,{},'init-throw',false,1],
 ['options-false',canonical,{},'options-false',false,1],['http-error',canonical,{},'http-error',false,1],
 ['close-throw',canonical,{},'close-throw',true,1],
 ['partial-env',null,{VENDERCRM_API_KEY:'synthetic-fixture'},'success',false,0],
 ['invalid-route',{...canonical,VENDERCRM_URL:'https://crm.example.com/api/v1/leads'}, {},'success',false,0],
 ['conflict',canonical,{VENDERCRM_URL:'https://other.example.com',VENDERCRM_API_KEY:'synthetic-fixture'},'success',false,0]
];
for(const [name,file,settings,mode,expectedSent,expectedCalls] of cases){
 const home=temp+'/'+name,pub=home+'/public';fs.mkdirSync(pub+'/lib',{recursive:true});fs.mkdirSync(home+'/private');for(const p of ['lead-forward.php','lib/vendercrm-config.php'])if(name!=='missing-helper'||p==='lead-forward.php')fs.copyFileSync(root+'/'+p,pub+'/'+p);if(file)fs.writeFileSync(home+'/private/vendercrm.php',configFile(file));
 const stub=mode?[
 "foreach(['CURLOPT_POST','CURLOPT_RETURNTRANSFER','CURLOPT_TIMEOUT','CURLOPT_HTTPHEADER','CURLOPT_POSTFIELDS','CURLINFO_HTTP_CODE'] as $i=>$constant)define($constant,$i+1);",
 "function curl_init($url){$GLOBALS['calls']++;if($url!=='https://crm.example.com/api/v1/leads')throw new RuntimeException('unexpected endpoint');if($GLOBALS['mode']==='init-throw')throw new RuntimeException('synthetic transport failure');return $GLOBALS['mode']==='init-false'?false:new stdClass();}",
 "function curl_setopt_array($ch,$options){$GLOBALS['options']=$options;return $GLOBALS['mode']!=='options-false';}",
 "function curl_exec($ch){return $GLOBALS['mode']==='exec-false'?false:'{}';}",
 "function curl_getinfo($ch,$option){return $GLOBALS['mode']==='http-error'?500:201;}",
 "function curl_errno($ch){return 0;}",
 "function curl_close($ch){if($GLOBALS['mode']==='close-throw')throw new RuntimeException('synthetic close failure');}"
 ].join('\n'):'';
 const wrapper='<?php $calls=0;$mode='+JSON.stringify(mode)+';'+stub+
 "\n$_POST=['phone'=>'synthetic-phone','name'=>'Synthetic fixture','message'=>'Test only','page_url'=>'https://gruas.example.com/'];$_SERVER['HTTP_X_REQUESTED_WITH']='XMLHttpRequest';"+
 '\nob_start();require '+JSON.stringify(pub+'/lead-forward.php')+';$result=ob_get_clean();'+
 '\nif($result!==\'{"ok":true}\'||http_response_code()!==200||$sentOk!=='+(expectedSent?'true':'false')+'||$calls!=='+expectedCalls+')exit(3);'+
 "\n$record=json_decode(file_get_contents(__DIR__.'/leads.jsonl'),true);if($record['phone']!=='synthetic-phone'||$record['source']!=='site:gruas-com-py'||strlen($record['idempotency_key'])!==32||!isset($record['received_at']))exit(4);"+
 "\nif(isset($options)){if($options[CURLOPT_HTTPHEADER]!==['Content-Type: application/json','X-Api-Key: synthetic-fixture'])exit(5);$body=json_decode($options[CURLOPT_POSTFIELDS],true);if($body!==$lead||isset($body['received_at']))exit(6);}";
 fs.writeFileSync(pub+'/fixture.php',wrapper);const env={...process.env};for(const k of ['VENDERCRM_URL','VENDERCRM_API_KEY','VENDERCRM_CONFIG_FILE'])delete env[k];Object.assign(env,settings);const result=cp.spawnSync(php,['-n',pub+'/fixture.php'],{encoding:'utf8',env});if(result.status!==0||result.stdout!=='')throw Error(name+' failed ('+result.status+')');
}
console.log(cases.length+' configuration/handler cases PASS; no HTTP');
