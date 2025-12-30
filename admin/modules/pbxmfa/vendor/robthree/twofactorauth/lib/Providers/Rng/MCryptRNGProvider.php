<?php

namespace RobThree\Auth\Providers\Rng;

class MCryptRNGProvider implements IRNGProvider
{
    /**
     * @param int $source
     */
    public function __construct(private $source = MCRYPT_DEV_URANDOM)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getRandomBytes($bytecount)
    {
        $result = @mcrypt_create_iv($bytecount, $this->source);
        if ($result === false) {
            throw new RNGException('mcrypt_create_iv returned an invalid value');
        }
        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function isCryptographicallySecure()
    {
        return true;
    }
}
