<?php

declare(strict_types=1);


$nr = $_GET['nr'];
$operator = $_GET['operator'];
$year = date('Y');

$url = "https://www.vagonweb.cz/razeni/vlak.php?zeme={$operator}&cislo={$nr}&rok=$year&lang=de";

header('content-type: text/html');
header("Access-Control-Allow-Origin: *");

echo file_get_contents($url);