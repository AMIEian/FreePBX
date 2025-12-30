<?php

namespace Tests\Providers\Time;

use RobThree\Auth\Providers\Time\ITimeProvider;

class TestTimeProvider implements ITimeProvider
{
    /**
     * @param int $time
     */
    function __construct(private $time)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getTime()
    {
        return $this->time;
    }
}
