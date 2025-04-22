import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const metadata: Metadata = {
  title: "API Documentation | URL Shortener",
  description: "API documentation for URL shortener service",
};

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">
        API Documentation
      </h1>
      <p className="mb-6 text-md sm:text-lg text-gray-600 dark:text-gray-400">
        This documentation covers the URL Shortener API which allows you to
        programmatically shorten URLs using your API key.
      </p>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                Learn about the URL Shortener API and how to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Base URL</h3>
              <p className="text-muted-foreground">
                All API requests should be made to:
                <code className="bg-muted ml-2 rounded p-1">
                  https://{process.env.VERCEL_URL || "yourdomain.com"}/api
                </code>
              </p>

              <h3 className="text-lg font-medium">Response Format</h3>
              <p className="text-muted-foreground">
                All responses are returned in JSON format.
              </p>

              <h3 className="text-lg font-medium">Rate Limits</h3>
              <p className="text-muted-foreground">
                Authenticated requests are limited to 100 requests per 10
                minutes. Unauthenticated requests are limited to 10 requests per
                10 minutes.
              </p>
              <p className="text-muted-foreground">
                Rate limit headers are included in each response:
              </p>
              <ul className="text-muted-foreground list-disc pl-6">
                <li>
                  <code className="bg-muted rounded p-1">
                    X-RateLimit-Limit
                  </code>
                  : Maximum number of requests allowed in the window
                </li>
                <li>
                  <code className="bg-muted rounded p-1">
                    X-RateLimit-Remaining
                  </code>
                  : Number of requests remaining in the current window
                </li>
                <li>
                  <code className="bg-muted rounded p-1">
                    X-RateLimit-Reset
                  </code>
                  : Time when the rate limit window resets (Unix timestamp)
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                How to authenticate your API requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The URL Shortener API uses API key-based authentication. You
                need to include your API key in the Authorization header of your
                requests.
              </p>

              <h3 className="text-lg font-medium">Getting an API Key</h3>
              <p className="text-muted-foreground">
                To get an API key, you need to sign in to your URL Shortener
                account and visit the API Key Management section. You can
                generate a new API key with a name and optional expiration date.
              </p>

              <h3 className="text-lg font-medium">Using Your API Key</h3>
              <div className="bg-muted rounded-md p-4">
                <pre className="text-xs">
                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </pre>
              </div>

              <p className="text-muted-foreground mt-2">
                Replace{" "}
                <code className="bg-muted rounded p-1">YOUR_API_KEY</code> with
                your actual API key.
              </p>

              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                <h4 className="font-medium">Security Warning</h4>
                <p className="text-sm">
                  Keep your API keys secure and never expose them in client-side
                  code or public repositories. Treat your API keys like
                  passwords.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints and their parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="mb-2 text-lg font-medium">Shorten URL</h3>
                <div className="bg-muted mb-4 rounded-md p-4">
                  <code className="text-sm">POST /api/shorten</code>
                </div>

                <h4 className="mt-4 mb-2 font-medium">Request Body</h4>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-xs">
                    {`{
  "url": "https://example.com/very-long-url",
  "customSlug": "my-custom-slug"
}`}
                  </pre>
                </div>

                <h4 className="mt-4 mb-2 font-medium">Response</h4>
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-xs">
                    {`{
  "id": "clfg7g3x10000jz08ys42z9q1",
  "shortUrl": "https://example.com/abcd123",
  "slug": "abcd123",
  "longUrl": "https://example.com/very-long-url",
  "createdAt": "2023-06-25T15:32:48.000Z"
}`}
                  </pre>
                </div>

                <h4 className="mt-4 mb-2 font-medium">Error Responses</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-sm">
                          Status Code
                        </th>
                        <th className="py-2 text-left text-sm">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground text-sm">
                      <tr className="border-b">
                        <td className="py-2">400</td>
                        <td className="py-2">Invalid request or URL</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">401</td>
                        <td className="py-2">Invalid API key</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">409</td>
                        <td className="py-2">Custom slug already taken</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">429</td>
                        <td className="py-2">Rate limit exceeded</td>
                      </tr>
                      <tr>
                        <td className="py-2">500</td>
                        <td className="py-2">Internal server error</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Examples for using the URL Shortener API in different languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">cURL</h3>
                <div className="bg-muted rounded-md p-4">
                  <pre className="overflow-x-auto text-xs">
                    {`curl -X POST "https://yourdomain.com/api/shorten" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/very-long-url"}'`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  JavaScript (Node.js)
                </h3>
                <div className="bg-muted rounded-md p-4">
                  <pre className="overflow-x-auto text-xs">
                    {`const fetch = require('node-fetch');

async function shortenUrl(url, customSlug) {
  const response = await fetch('https://yourdomain.com/api/shorten', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      customSlug, // Optional
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to shorten URL');
  }

  return data;
}

// Example usage
shortenUrl('https://example.com/very-long-url')
  .then(data => console.log(data.shortUrl))
  .catch(error => console.error(error));`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Python</h3>
                <div className="bg-muted rounded-md p-4">
                  <pre className="overflow-x-auto text-xs">
                    {`import requests
import json

def shorten_url(url, custom_slug=None, api_key="YOUR_API_KEY"):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "url": url
    }

    if custom_slug:
        data["customSlug"] = custom_slug

    response = requests.post(
        "https://yourdomain.com/api/shorten",
        headers=headers,
        data=json.dumps(data)
    )

    if response.status_code != 200:
        raise Exception(f"Error: {response.json().get('error', 'Unknown error')}")

    return response.json()

# Example usage
try:
    result = shorten_url("https://example.com/very-long-url")
    print(f"Short URL: {result['shortUrl']}")
except Exception as e:
    print(str(e))`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">iOS Shortcut</h3>
                <p className="text-muted-foreground mb-2">
                  To use with iOS Shortcuts, create a new shortcut with the
                  following actions:
                </p>
                <ol className="text-muted-foreground mb-4 list-decimal pl-6">
                  <li>
                    Add a &quot;URL&quot; action with your API endpoint{" "}
                    <code>https://yourdomain.com/api/shorten</code>
                  </li>
                  <li>
                    Add a &quot;Get Contents of URL&quot; action with:
                    <ul className="mt-1 list-disc pl-6">
                      <li>Method: POST</li>
                      <li>
                        Headers: &quot;Authorization&quot; =
                        &quot;Bearer YOUR_API_KEY&quot;, &quot;Content-Type&quot; =
                        &quot;application/json&quot;
                      </li>
                      <li>
                        Request Body: JSON with &quot;url&quot; key and the URL
                        you want to shorten (can use variables)
                      </li>
                    </ul>
                  </li>
                  <li>
                    Add a &quot;Get Dictionary Value&quot; action to extract the
                    &quot;shortUrl&quot; from the response
                  </li>
                  <li>
                    Add actions to copy to clipboard, share, or use the
                    shortened URL as needed
                  </li>
                </ol>
                <p className="text-muted-foreground">
                  You can download a premade shortcut template from our website
                  and customize it with your API key.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
