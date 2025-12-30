<?php

use GraphQL\SimpleClient\Client;
use GraphQL\SimpleClient\Exception\GraphQLInvalidResponse;
use GraphQL\SimpleClient\Response;

test('client returns raw', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}}}';

    $stream = \Mockery::mock(\Psr\Http\Message\StreamInterface::class);
    $stream->shouldReceive('getContents')->andReturn($data);

    $responseMessage = \Mockery::mock(\Psr\Http\Message\ResponseInterface::class);
    $responseMessage->shouldReceive('getBody')->andReturn($stream);

    $guzzleClient = \Mockery::mock(\GuzzleHttp\Client::class);
    $guzzleClient->shouldReceive('request')->andReturn($responseMessage);

    $client = new Client('SomeWebsite');
    $client->setGuzzle($guzzleClient);
    $client->setUrl('');
    $response = $client->raw('')->getBody()->getContents();

    expect($response)->toEqual($data);
});

test('client returns json', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}}}';

    $stream = \Mockery::mock(\Psr\Http\Message\StreamInterface::class);
    $stream->shouldReceive('getContents')->andReturn($data);

    $responseMessage = \Mockery::mock(\Psr\Http\Message\ResponseInterface::class);
    $responseMessage->shouldReceive('getBody')->andReturn($stream);

    $guzzleClient = \Mockery::mock(\GuzzleHttp\Client::class);
    $guzzleClient->shouldReceive('request')->andReturn($responseMessage);

    $client = new Client('SomeWebsite');
    $client->setGuzzle($guzzleClient);
    $response = $client->json('');

    expect($response)->toEqual(json_decode($data, true));
});

test('client returns invalid json exception', function () {
    $data = '{"data":{"On';

    $stream = \Mockery::mock(\Psr\Http\Message\StreamInterface::class);
    $stream->shouldReceive('getContents')->andReturn($data);

    $responseMessage = \Mockery::mock(\Psr\Http\Message\ResponseInterface::class);
    $responseMessage->shouldReceive('getBody')->andReturn($stream);

    $guzzleClient = \Mockery::mock(\GuzzleHttp\Client::class);
    $guzzleClient->shouldReceive('request')->andReturn($responseMessage);

    $client = new Client('SomeWebsite');
    $client->setGuzzle($guzzleClient);

    static::expectException(GraphQLInvalidResponse::class);

    $response = $client->json('');

    expect($response)->toEqual(json_decode($data));
});

test('client returns response', function () {
    $data = '{"data":{"One":{"id":"1","name":"One Name","translations":[{"id":"1","code":"sv","name":"Ett Namn"},' .
        '{"id":"2","code":"fr","name":"Un Nom"}]},"Two":{"id":"2","name":"Two Name"}}}';

    $json = json_decode($data);

    $stream = \Mockery::mock(\Psr\Http\Message\StreamInterface::class);
    $stream->shouldReceive('getContents')->andReturn($data);

    $responseMessage = \Mockery::mock(\Psr\Http\Message\ResponseInterface::class);
    $responseMessage->shouldReceive('getBody')->andReturn($stream);

    $guzzleClient = \Mockery::mock(\GuzzleHttp\Client::class);
    $guzzleClient->shouldReceive('request')->andReturn($responseMessage);

    $client = new Client('SomeWebsite');
    $client->setGuzzle($guzzleClient);
    $response = $client->response('');

    expect($response)->toBeInstanceOf(Response::class);
});
