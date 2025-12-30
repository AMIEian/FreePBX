<?php

declare(strict_types=1);

namespace GraphQL\SimpleClient;

use GraphQL\SimpleClient\Exception\GraphQLInvalidResponse;
use GuzzleHttp\Client as GuzzleClient;
use Psr\Http\Message\ResponseInterface;

class Client
{
    protected GuzzleClient $guzzle;

    public function __construct(
        protected string $url,
    ) {
        $this->guzzle = new GuzzleClient();
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    public function setGuzzle(GuzzleClient $guzzle): void
    {
        $this->guzzle = $guzzle;
    }

    public function raw(string $query, array $variables = [], array $headers = []): ResponseInterface
    {
        return $this->guzzle->request('POST', $this->url, [
            'json' => [
                'query' => $query,
                'variables' => $variables
            ],
            'headers' => $headers
        ]);
    }

    public function json(string $query, array $variables = [], array $headers = [], bool $assoc = true): array|\stdClass
    {
        $response = $this->raw($query, $variables, $headers);

        $responseJson = json_decode($response->getBody()->getContents(), $assoc);

        if ($responseJson === null) {
            throw new GraphQLInvalidResponse('GraphQL did not provide a valid JSON response. Please make sure you are pointing at the correct URL.');
        }

        return $responseJson;
    }

    public function response(string $query, array $variables = [], array $headers = []): Response
    {
        $response = $this->json($query, $variables, $headers);

        return new Response($response);
    }
}
