<?php

use quasiuna\paintai\AiScript;
use quasiuna\paintai\Cleaner;
use quasiuna\paintai\RateLimiter;
use quasiuna\paintai\Log;

require '../bootstrap.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

switch ($_GET['method'] ?? null) {
    case 'load':
        if (!empty($_GET['plugin'])) {
            $plugin = $_GET['plugin'];

            try {
                $limitedUser = new RateLimiter;
                $ai = new AiScript([
                    'name' => $plugin,
                    'user' => $limitedUser->getUserIdentifier(),
                ]);
                $code = $ai->getValidPluginCode($plugin);
                exit(json_encode(['tool' => $ai->getClass(), 'pluginCode' => $code]));
            } catch (\Exception $e) {
                exit(json_encode(['error' => $e->getMessage()]));
            }
        }
        break;
    case 'ai':


        // $script = "plugins.Playground = class extends Tool {
        //     constructor(name) {
        //         super(name);
        //         this.name = name;
        //         this.description = 'Playground';
        //         this.icon = 'fa-play';
        //     }
        
        //     draw(e) {
        //         // Add your implementation here
        //     }
        
        //     customUI(container) {
        //         // Add your custom UI controls here
        //     }
        // }";
        // exit(json_encode(['tool' => 'playground', 'pluginCode' => $script]));

        $limitedUser = new RateLimiter;

        if (!$limitedUser->canAccessAPI()) {
            //TODO: handle this situation more gracefully in terms of the UX - "e.g. please wait for X seconds"
            throw new \Exception("Rate Limit Exceeded");
        }

        $params = parseRawJsonRequest();
        $params['user'] = $limitedUser->getUserIdentifier();

        Log::debug(json_encode($params));
        $ai = new AiScript($params);
        $script = $ai->create();

        exit(json_encode(['tool' => $ai->getClass(), 'pluginCode' => $script]));

        break;
    case 'banter':
        $params = parseRawJsonRequest();
        Log::debug(json_encode($params));
        if (!empty($params['name'])) {
            $tool_name = trim(Cleaner::removeNewLinesFromString($params['name']));
        } else {
            throw new \Exception("Invalid prompt");
        }
        $api_key = getenv('OPENAI_API_KEY');
        $client = OpenAI::client($api_key);

        Log::debug('Requesting banter from OpenAI');

        $result = $client->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => '(RULES: Respond only with the text of the joke, no explanation!) Tell me a joke about a feature for a Paint program where the user uses a "' . $tool_name . '" to create their artwork'
                ],
            ],
        ]);

        Log::debug('Response received from OpenAI');
        Log::debug(json_encode($result->usage ?? 'Unable to get token usage'));
        $response = $result->choices[0]->message->content ?? '';
        Log::debug($response);
        exit(json_encode(['banter' => $response]));
        break;
    default:
        exit('404 - Method not found');
        break;
}

