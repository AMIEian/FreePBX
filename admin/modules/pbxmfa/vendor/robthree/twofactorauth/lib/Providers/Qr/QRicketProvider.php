<?php

namespace RobThree\Auth\Providers\Qr;

// http://qrickit.com/qrickit_apps/qrickit_api.php
class QRicketProvider extends BaseHTTPQRCodeProvider
{
    /**
     * @param string $errorcorrectionlevel
     * @param string $bgcolor
     * @param string $color
     * @param string $format
     */
    public function __construct(public $errorcorrectionlevel = 'L', public $bgcolor = 'ffffff', public $color = '000000', public $format = 'p')
    {
        $this->verifyssl = false;
    }

    /**
     * {@inheritdoc}
     */
    public function getMimeType()
    {
        return match (strtolower($this->format)) {
            'p' => 'image/png',
            'g' => 'image/gif',
            'j' => 'image/jpeg',
            default => throw new QRException(sprintf('Unknown MIME-type: %s', $this->format)),
        };
    }

    /**
     * {@inheritdoc}
     */
    public function getQRCodeImage($qrtext, $size)
    {
        return $this->getContent($this->getUrl($qrtext, $size));
    }

    /**
     * @param string $qrtext the value to encode in the QR code
     * @param int|string $size the desired size of the QR code
     *
     * @return string file contents of the QR code
     */
    public function getUrl($qrtext, $size)
    {
        return 'http://qrickit.com/api/qr'
            . '?qrsize=' . $size
            . '&e=' . strtolower($this->errorcorrectionlevel)
            . '&bgdcolor=' . $this->bgcolor
            . '&fgdcolor=' . $this->color
            . '&t=' . strtolower($this->format)
            . '&d=' . rawurlencode($qrtext);
    }
}
