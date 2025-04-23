import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CodeBlock } from "~/components/ui/code-block";
import { ArrowRight, Info, Shield, Code, Terminal, Package, Check, Home } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { ThemeToggle } from "~/app/_components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "API Documentation | URL Shortener",
  description: "API documentation for URL shortener service",
};

// Set the domain for the API
const DOMAIN = "https://www.shorturlx.xyz";

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 pb-12">
      <div className="flex justify-between items-center pt-4 mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Home</span>
        </Link>
        
        <ThemeToggle />
      </div>

      <div className="flex flex-col space-y-4 text-center mb-10 pt-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          API Documentation
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Integrate URL shortening into your applications with our RESTful API
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto mb-8">
          <TabsList className="h-12 justify-start rounded-lg p-1 w-auto ">
            <TabsTrigger value="overview" className="flex items-center gap-2 h-10 px-4">
              <Info className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="authentication" className="flex items-center gap-2 h-10 px-4">
              <Shield className="h-4 w-4" /> Authentication
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2 h-10 px-4">
              <ArrowRight className="h-4 w-4" /> Endpoints
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2 h-10 px-4">
              <Code className="h-4 w-4" /> Code Examples
            </TabsTrigger>
            <TabsTrigger value="cli" className="flex items-center gap-2 h-10 px-4">
              <Terminal className="h-4 w-4" /> CLI Tool
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="space-y-4">
          <TabsContent value="overview" className="mt-0">
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">API Overview</CardTitle>
                <CardDescription className="text-base">
                  Learn about the URL Shortener API and how to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Base URL</h3>
                  <CodeBlock
                    code={`${DOMAIN}/api`}
                    language="text"
                    showLineNumbers={false}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Response Format</h3>
                  <p className="text-muted-foreground mb-4">
                    All responses are returned in JSON format.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Rate Limits</h3>
                  <p className="text-muted-foreground mb-3">
                    API requests are subject to rate limiting:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-5">
                    <li className="flex items-center gap-2">
                      <Badge className="mr-1">Authenticated</Badge> 100 requests per 10 minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="mr-1">Unauthenticated</Badge> 10 requests per 10 minutes
                    </li>
                  </ul>
                  
                  <p className="text-muted-foreground mb-3">
                    Rate limit headers are included in each response:
                  </p>
                  <CodeBlock
                    code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1698759340`}
                    language="text"
                    showLineNumbers={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="mt-0">
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Authentication</CardTitle>
                <CardDescription className="text-base">
                  How to authenticate your API requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <p className="text-muted-foreground text-lg">
                  The URL Shortener API uses API key-based authentication. You
                  need to include your API key in the Authorization header of your
                  requests.
                </p>

                <div>
                  <h3 className="text-lg font-medium mb-3">Getting an API Key</h3>
                  <p className="text-muted-foreground mb-4">
                    To get an API key, sign in to your ShortURLx account and visit the 
                    API Key Management section in your dashboard. You can generate a new API 
                    key with a name and optional expiration date.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Using Your API Key</h3>
                  <CodeBlock
                    code={'Authorization: Bearer YOUR_API_KEY'}
                    language="text"
                    showLineNumbers={false}
                    fileName="HTTP Header"
                  />
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" /> Security Warning
                  </h4>
                  <p className="text-sm">
                    Never expose your API keys in client-side code or public repositories. 
                    Protect your API keys and use environment variables when developing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="mt-0">
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">API Endpoints</CardTitle>
                <CardDescription className="text-base">
                  Available endpoints and their parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-green-600 hover:bg-green-600">POST</Badge>
                    <h3 className="font-medium text-lg">
                      /api/shorten
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-5">
                    Creates a new shortened URL from a long URL.
                  </p>

                  <h4 className="font-medium mb-3">Request Body</h4>
                  <CodeBlock
                    code={`{
  "url": "https://example.com/very-long-url",
  "customSlug": "my-custom-slug"  // Optional
}`}
                    language="json"
                    fileName="Request JSON"
                  />

                  <h4 className="font-medium mt-6 mb-3">Response</h4>
                  <CodeBlock
                    code={`{
  "id": "clfg7g3x10000jz08ys42z9q1",
  "shortUrl": "${DOMAIN}/abcd123",
  "slug": "abcd123",
  "longUrl": "https://example.com/very-long-url",
  "createdAt": "2023-06-25T15:32:48.000Z"
}`}
                    language="json"
                    fileName="Response JSON"
                  />

                  <h4 className="font-medium mt-6 mb-3">Error Responses</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Status Code
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">400</td>
                          <td className="px-4 py-3 text-sm">Invalid request or URL</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">401</td>
                          <td className="px-4 py-3 text-sm">Invalid API key</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">409</td>
                          <td className="px-4 py-3 text-sm">Custom slug already taken</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">429</td>
                          <td className="px-4 py-3 text-sm">Rate limit exceeded</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">500</td>
                          <td className="px-4 py-3 text-sm">Internal server error</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="mt-0">
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Code Examples</CardTitle>
                <CardDescription className="text-base">
                  Examples for using the URL Shortener API in different languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 pt-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">cURL</h3>
                  <CodeBlock
                    code={`curl -X POST "${DOMAIN}/api/shorten" \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"url":"https://example.com/very-long-url"}'`}
                    language="bash"
                    fileName="cURL"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">JavaScript (Node.js)</h3>
                  <CodeBlock
                    code={`const fetch = require('node-fetch');

async function shortenUrl(url, customSlug) {
  const response = await fetch('${DOMAIN}/api/shorten', {
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
                    language="javascript"
                    fileName="Node.js"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Python</h3>
                  <CodeBlock
                    code={`import requests
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
        "${DOMAIN}/api/shorten",
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
                    language="python"
                    fileName="Python"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">iOS Shortcut</h3>
                  <p className="text-muted-foreground mb-4">
                    To use with iOS Shortcuts, create a new shortcut with the
                    following actions:
                  </p>
                  <ol className="text-muted-foreground space-y-3 list-decimal pl-6 mb-5">
                    <li>
                      Add a &quot;URL&quot; action with your API endpoint 
                      <code className="bg-muted mx-1 px-1.5 py-0.5 rounded text-xs">
                        {DOMAIN}/api/shorten
                      </code>
                    </li>
                    <li>
                      Add a &quot;Get Contents of URL&quot; action with:
                      <ul className="mt-2 space-y-2 list-disc pl-6">
                        <li>Method: POST</li>
                        <li>
                          Headers: &quot;Authorization&quot; = &quot;Bearer YOUR_API_KEY&quot;, 
                          &quot;Content-Type&quot; = &quot;application/json&quot;
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
                  <div className="rounded-lg bg-muted p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm space-y-2">
                      <p>
                        You can download a premade shortcut template from our website
                        and customize it with your API key.
                      </p>
                      <p className="font-medium text-primary">
                        Coming soon: A direct download link will be available here to get our 
                        ready-to-use URL Shortener iOS Shortcut.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cli" className="mt-0">
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">ShortURLX CLI Tool</CardTitle>
                <CardDescription className="text-base">
                  Use our command-line tool for shortening URLs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div className="flex items-start gap-3">
                  <Package className="h-8 w-8 mt-1 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">npm Package</h3>
                    <p className="text-muted-foreground mb-4">
                      We provide an official npm package for shortening URLs directly from your terminal.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Installation</h3>
                  <CodeBlock
                    code={'npm install -g shorturlx-cli'}
                    language="bash"
                    fileName="Install globally"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Basic Usage</h3>
                  <CodeBlock
                    code={'shorturlx --url "https://example.com/very-long-url" --api-key "YOUR_API_KEY"'}
                    language="bash"
                    fileName="Basic command"
                  />
                  <p className="text-muted-foreground mt-4 mb-2">Example output:</p>
                  <CodeBlock
                    code={`Short URL: ${DOMAIN}/abcd123
Original URL: https://example.com/very-long-url
Created at: 6/25/2023, 3:32:48 PM
Short URL copied to clipboard!`}
                    language="text"
                    showLineNumbers={false}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Options</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Option</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--url, -u</code></td>
                          <td className="px-4 py-3 text-sm">The URL to shorten (required)</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--custom, -c</code></td>
                          <td className="px-4 py-3 text-sm">Custom slug (optional)</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--api-key, -k</code></td>
                          <td className="px-4 py-3 text-sm">Your API key (can also be set via environment variable)</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--endpoint, -e</code></td>
                          <td className="px-4 py-3 text-sm">API endpoint (defaults to our official endpoint)</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--copy, -cp</code></td>
                          <td className="px-4 py-3 text-sm">Copy shortened URL to clipboard (defaults to true)</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm"><code>--help</code></td>
                          <td className="px-4 py-3 text-sm">Show help</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">API Key Configuration</h3>
                  <p className="text-muted-foreground mb-4">
                    You can provide your API key in two ways:
                  </p>
                  
                  <ol className="text-muted-foreground list-decimal space-y-2 pl-6 mb-5">
                    <li>Command line argument: <code>--api-key</code> or <code>-k</code></li>
                    <li>Environment variable: <code>SHORTURL_API_KEY</code></li>
                  </ol>
                  
                  <p className="text-muted-foreground mb-3">Setting up the environment variable:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Windows:</h4>
                      <CodeBlock
                        code={'setx SHORTURL_API_KEY "YOUR_API_KEY"'}
                        language="cmd"
                        showLineNumbers={false}
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">macOS/Linux:</h4>
                      <CodeBlock
                        code={'echo \'export SHORTURL_API_KEY="YOUR_API_KEY"\' >> ~/.bash_profile\n# or for zsh users:\necho \'export SHORTURL_API_KEY="YOUR_API_KEY"\' >> ~/.zshrc'}
                        language="bash"
                        showLineNumbers={false}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mt-4 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                    <p className="text-sm">
                      Using the environment variable allows you to avoid exposing your API key in command history or process listings.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Additional Examples</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">With custom slug:</h4>
                      <CodeBlock
                        code={'shorturlx --url "https://example.com/very-long-url" --custom "my-custom-slug" --api-key "YOUR_API_KEY"'}
                        language="bash"
                        showLineNumbers={false}
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Using a different endpoint:</h4>
                      <CodeBlock
                        code={'shorturlx --url "https://example.com/very-long-url" --endpoint "https://your-custom-instance.com/api/shorten"'}
                        language="bash"
                        showLineNumbers={false}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Shorten URLs with a simple command</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Support for custom slugs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Automatic clipboard copying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Colorized output</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>API key authentication</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}