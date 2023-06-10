<?php

declare(strict_types=1);

$query = $_GET['q'];
$year = date('Y');

$url = "https://www.vagonweb.cz/razeni/json_vlaky.php?jmeno=$query&rok=$year";

header('content-type: application/json');
header("Access-Control-Allow-Origin: *");

$json = file_get_contents($url);
$results = json_decode($json, true) ?: [];
echo json_encode(
    array_map(fn($item) => [
        'type' => $item['druh'],
        'nr' => $item['cislo'],
        'title' => $item['value'],
        'name' => $item['nazev'],
        'route' => $item['trasa'],
        'operator' => $item['zeme'],
        'vagonweb' => "https://www.vagonweb.cz/razeni/vlak.php?zeme={$item['zeme']}&cislo={$item['cislo']}&rok=$year&lang=de",
        'html' => "/train.php?operator={$item['zeme']}&nr={$item['cislo']}",
    ], $results)
);