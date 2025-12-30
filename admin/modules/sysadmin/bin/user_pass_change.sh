#!/bin/bash

pass_file="/var/log/pass_change.log"

echo "Changing \"sangoma\" user password to MAC address of the system" >> $pass_file
iface=$(ip route | grep default | sed 's/.*dev \([a-zA-Z0-9-]*\)/\1/' | xargs)

mac_address=$(cat /sys/class/net/$iface/address | td -d ':')

echo "Mac address for default route interface $iface is $mac_address" >> $pass_file

if [ -z "$mac_address" ]; then
 echo " No active network interfaces found" >> $pass_file
 exit 1
fi

echo "Setting \"$mac_address\" as the 'sangoma' user password....." >> $pass_file
echo "sangoma:$mac_address" | sudo chpasswd

echo "Making sure 'sangoma' user password is expired on next login and user must reset the SSH password....."
chage -d 0 sangoma
