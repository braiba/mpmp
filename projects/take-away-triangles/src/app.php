<?php

$con = pg_connect('host=localhost port=5432 dbname=mpmp user=postgres password=password');

if (!$con) {
    die(pg_errormessage());
}

pg_query($con, 'SET search_path = "take-away-triangles"');

define('MAX', 100);

pg_query($con, 'TRUNCATE TABLE "triangles";');


for ($a = 0; $a <= MAX; $a++) {
    for ($b = $a; $b <= MAX; $b++) {
        for ($c = $b; $c <= MAX; $c++) {
            $key = $a . '.' . $b . '.' . $c;
            $next = [abs($a-$b), abs($b-$c), abs($c-$a)];
            sort($next);
            list($a2, $b2, $c2) = $next;
            $nextKey = $a2 . '.' . $b2 . '.' . $c2;
            $sql = 'INSERT INTO "triangles" (key, a, b, c, next) VALUES (\'' . $key . '\', ' . $a . ', ' . $b . ', ' . $c . ', \'' . $nextKey . '\');';
            pg_query($con, $sql);
        }
    }
}


