<?php

use GraphQL\SimpleClient\Response;

beforeEach(function () {
});

test('response returns all data', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->all())->toEqual($jsonObj->data);
});

test('response has errors', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->hasErrors())->toBeTrue();
});

test('response has no errors', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}}}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->hasErrors())->toBeFalse();
});

test('response returns errors', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->errors())->toEqual($jsonObj->errors);
});

test('response returns no errors', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}}}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->errors())->toBeEmpty();
});

test('response returns json', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->toJson())->toEqual(json_encode($jsonObj->data));
});

test('can get value from response', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect($response->One->translations[0]->code)->toEqual('sv');
    expect($response->Two->name)->toEqual('Two Name');
});

test('isset returns correctly', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}},"errors":[{"message":"Error",' .
        '"locations":[{"line":1,"column":28}]},{"message":"Error","locations":[{"line":1,"column":28}]}]}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect(isset($response->One->translations[0]->code))->toBeTrue();
    expect(isset($response->Two->translations[0]->code))->toBeFalse();
});

test('isset returns correctly with missing field', function () {
    $data = '{"data":{"One":1}}';

    $jsonObj = json_decode($data);

    $response = new Response($jsonObj);

    expect(isset($response->One))->toBeTrue();
    expect(isset($response->Two))->toBeFalse();
});
