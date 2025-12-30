<?php

namespace RobThree\Auth\Providers\Rng;

class HashRNGProvider implements IRNGProvider
{
    /** @var string */
    private $algorithm;

    /**
     * @param string $algorithm
     */
    public function __construct($algorithm = 'sha256')
    {
        $algos = array_values(hash_algos());
        if (!in_array($algorithm, $algos, true)) {
            throw new RNGException('Unsupported algorithm specified');
        }
        $this->algorithm = $algorithm;
    }

    /**
     * {@inheritdoc}
     */
    public function getRandomBytes($bytecount)
    {
        $result = '';
        $hash = random_int(0, mt_getrandmax());
        for ($i = 0; $i < $bytecount; $i++) {
            $hash = hash($this->algorithm, $hash . random_int(0, mt_getrandmax()), true);
            $result .= $hash[random_int(0, strlen($hash) - 1)];
        }
        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function isCryptographicallySecure()
    {
        return false;
    }
}
