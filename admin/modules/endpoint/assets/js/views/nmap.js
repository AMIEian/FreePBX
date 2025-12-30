function validateNetwork() {
    const networkValue = document.getElementById("network").value.trim();
    if (networkValue === '') {
        return true;// Allow empty input
    }
    
    // Validate IP CIDR format
    const ipCidrRegExp = /^(\d+\.){3}\d+\/\d+$/;
    // Validate hostname CIDR format (supports domains with hyphens and optional port)
    const hostnameCidrRegExp = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?(?::\d+)?\/\d+$/;
    
    if (!ipCidrRegExp.test(networkValue) && !hostnameCidrRegExp.test(networkValue)) {
        alert(_('Invalid format! Use x.x.x.x/x or hostname/x format'));
        return false;
    }
    return true;
}