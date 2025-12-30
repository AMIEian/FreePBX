<?php

namespace Tests\Providers\Rng;

trait NeedsRngLengths
{
    /** @var array */
    protected $rngTestLengths = [1, 16, 32, 256];
}
