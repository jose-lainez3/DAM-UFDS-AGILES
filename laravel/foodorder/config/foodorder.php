<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tasa de impuesto
    |--------------------------------------------------------------------------
    |
    | Se aplica sobre el subtotal de cada pedido (0.13 = 13 %). Ajústala en el
    | archivo .env con TASA_IMPUESTO según la normativa fiscal de tu local.
    |
    */

    'tasa_impuesto' => (float) env('TASA_IMPUESTO', 0.13),

];
