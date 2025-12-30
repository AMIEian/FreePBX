
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function updateQueryParamsInUrl(fieldName = false, value = false, clearQueryParams = false) {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    if (fieldName && value) {
        params.set(fieldName, value);
    }
    const newUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}${!clearQueryParams ? '?' + params.toString() : ""}`;
    history.pushState(null, '', newUrl);
}

function deleteQueryParamsInUrl(fieldName = false) {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.delete(fieldName);
    const newUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}${'?' + params.toString()}`;
    history.pushState(null, '', newUrl);
}

function checkEncodeURI(str) {
    return /\%/i.test(str)
}

function getQueryParams(params) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(params);
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function camelCaseToNormalText(text) {
    if (text.match(/[^A-Z]/)) {
        let result = text.replaceAll("_", " ");
        result = result.replace(/(?<=[^A-Z])[A-Z](?=[^A-Z])/g, " $&");
        result = result.replace(/\s+/g, " ");
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return text;
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};