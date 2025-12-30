<?php

namespace Tests\Providers\Rng;

use RobThree\Auth\Providers\Rng\IRNGProvider;

class TestRNGProvider implements IRNGProvider
{
    /**
     * @param bool $isSecure whether this provider is cryptographically secure
     */
    function __construct(private $isSecure = false)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getRandomBytes($bytecount)
    {
        $result = '';

        for ($i = 0; $i < $bytecount; $i++) {
            $result .= chr($i);
        }

        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function isCryptographicallySecure()
    {
        return $this->isSecure;
    }
}
