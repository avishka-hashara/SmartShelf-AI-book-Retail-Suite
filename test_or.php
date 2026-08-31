<?php
$res = file_get_contents('https://openrouter.ai/api/v1/models');
$data = json_decode($res, true);
foreach($data['data'] as $m) {
    if(strpos($m['id'], ':free') !== false) {
        echo $m['id'] . PHP_EOL;
    }
}
