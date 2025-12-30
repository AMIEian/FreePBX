#!/bin/bash

#!/bin/bash

SOX="/usr/bin/sox -M"
RM="/bin/rm"
MV="/bin/mv"

FILE="$1/monitor/$2/$3/$4/$5"
FILE2="$7/$2/$3/$4/$5"

IN="${FILE}_recv.$6"
OUT="${FILE}_tran.$6"
DESTINATION="${FILE}.$6"
ORGI="${FILE}.${6}"
ORGIMV="${FILE}_moved.${6}"

# Check if IN exists, otherwise fallback to FILE2
if [ ! -f "$IN" ]; then
    # Try with FILE2
    FILE="$FILE2"
    IN="${FILE}_recv.$6"
    OUT="${FILE}_tran.$6"
    DESTINATION="${FILE}.$6"
    ORGI="${FILE}.${6}"
    ORGIMV="${FILE}_moved.${6}"

    if [ ! -f "$IN" ]; then
        echo "Neither $IN nor fallback file found. Exiting." >> /var/log/asterisk/freepbx.log
        exit 1
    fi
fi

$MV "$ORGI" "$ORGIMV"
if $SOX "$IN" "$OUT" "$DESTINATION"; then
    $RM "$IN" "$OUT"
    $RM "$ORGIMV"
else
    echo "SOX command failed." >> /var/log/asterisk/freepbx.log
    $MV "$ORGIMV" "$ORGI"
fi
