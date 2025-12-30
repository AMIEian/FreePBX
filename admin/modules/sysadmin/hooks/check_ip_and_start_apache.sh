#!/bin/bash

# Restart httpd only if system has valid ip

# Function to check if an IP address is available
check_ip() {
    ip_addr=$(ip addr show | grep -v "127.0.0.1" | grep -oP 'inet \K[\d.]+')

    if [[ -z "$ip_addr" ]]; then
        exit 1  # Exit with error if no IP address found
    else
        return 0  # Return 0 if IP address is found
    fi
}

# Run the IP check
check_ip

# If IP address is found, start Apache
if [[ $? -eq 0 ]]; then
    exit 0
else
    exit 1
fi
