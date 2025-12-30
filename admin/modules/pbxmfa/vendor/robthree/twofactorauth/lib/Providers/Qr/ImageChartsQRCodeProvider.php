<?php

namespace RobThree\Auth\Providers\Qr;

// https://image-charts.com
class ImageChartsQRCodeProvider extends BaseHTTPQRCodeProvider
{
    /**
     * @param bool $verifyssl
     * @param string $errorcorrectionlevel
     * @param int $margin
     */
    public function __construct($verifyssl = false, public $errorcorrectionlevel = 'L', public $margin = 1)
    {
        if (!is_bool($verifyssl)) {
            throw new QRException('VerifySSL must be bool');
        }

        $this->verifyssl = $verifyssl;
    }

    /**
     * {@inheritdoc}
     */
    public function getMimeType()
    {
        return 'image/png';
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
     * @param int $size the desired size of the QR code
     *
     * @return string file contents of the QR code
     */
    public function getUrl($qrtext, $size)
    {
        return 'https://image-charts.com/chart?cht=qr'
            . '&chs=' . ceil($size / 2) . 'x' . ceil($size / 2)
            . '&chld=' . $this->errorcorrectionlevel . '|' . $this->margin
            . '&chl=' . rawurlencode($qrtext);
    }
}
