const ALL_SUMMARY_REPORT = 'allsummary';
const ALL_CALLS_REPORT = 'allcalls';
const INBOUND_REPORT = 'inbound';
const OUTBOUND_REPORT = 'outbound';
const INTERNAL_REPORT = 'internal';
const MISSED_REPORT = 'missed';
const ANSWERED_REPORT = 'answered';
const EXTENSION_DETAIL_REPORT = 'extensiondetail';
const EXTENSION_SUMMARY_REPORT = 'extensionsummary';
const DID_DETAIL_REPORT = 'diddetail';
const RING_GROUP_REPORT = 'ringgroup';
const QUEUE_REPORT = 'queue';
const INBOUND_UNIQUE_REPORT = 'inbound_unique_calls';

const previewCols = [
    {
        title: "Reports From",
        field: "from"
    },
    {
        title: "Reports till",
        field: "till"
    },
    {
        title: "Report will be sent on",
        field: "sent"
    }
];