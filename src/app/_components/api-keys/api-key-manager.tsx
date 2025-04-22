"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  KeyIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyManager({ open, onOpenChange }: ApiKeyManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  const { data: apiKeys, refetch } = api.apiKey.getUserApiKeys.useQuery();
  const createKeyMutation = api.apiKey.createApiKey.useMutation({
    onSuccess: (data) => {
      setNewKeyValue(data.key);
      refetch();
    },
  });
  const revokeKeyMutation = api.apiKey.revokeApiKey.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateKey = () => {
    if (newKeyName.trim() === "") return;
    createKeyMutation.mutate({ name: newKeyName });
    setNewKeyName("");
  };

  const handleRevokeKey = (id: string) => {
    revokeKeyMutation.mutate({ id });
    setKeyToRevoke(null);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyIcon className="mr-2 h-5 w-5" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Create and manage API keys for programmatic access to the URL
            shortener.
          </DialogDescription>
        </DialogHeader>

        {/* New Key Creation Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Name your API key to help identify its usage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">API Key Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., iOS Shortcut Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateKey}
                disabled={
                  createKeyMutation.isPending || newKeyName.trim() === ""
                }
              >
                {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Display newly created key */}
        {newKeyValue && (
          <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                New API Key Created
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                Copy this key now. You won`&apos;`t be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center">
                  <Input
                    type={showNewKey ? "text" : "password"}
                    value={newKeyValue}
                    readOnly
                    className="pr-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-12"
                    onClick={() => setShowNewKey(!showNewKey)}
                  >
                    {showNewKey ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2"
                    onClick={() => handleCopyKey(newKeyValue)}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewKeyValue(null)}
              >
                Done
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* List existing API keys */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Keys are used to authenticate API requests. Protect them like
              passwords.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                      <TableCell>
                        {apiKey.lastUsedAt
                          ? formatDate(apiKey.lastUsedAt)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {apiKey.expiresAt ? (
                          <Badge>{formatDate(apiKey.expiresAt)}</Badge>
                        ) : (
                          <Badge variant="outline">Never</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setKeyToRevoke(apiKey.id)}
                              >
                                Revoke
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Revoke this API key</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No API keys found</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Create your first API key to access the URL shortener
                  programmatically
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsCreating(true)}>
              Create New API Key
            </Button>
          </CardFooter>
        </Card>

        {/* API Usage Examples */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>API Usage Examples</CardTitle>
            <CardDescription>
              Examples for using your API key to shorten URLs programmatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold">HTTP Request</h4>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                  {`POST /api/shorten HTTP/1.1
Host: ${typeof window !== "undefined" ? window.location.host : "example.com"}
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "customSlug": "my-custom-slug" // Optional
}`}
                </pre>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-semibold">cURL Example</h4>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                  {`curl -X POST "https://${typeof window !== "undefined" ? window.location.host : "example.com"}/api/shorten" \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"url":"https://example.com/very-long-url"}'`}
                </pre>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-semibold">
                  JavaScript Example
                </h4>
                <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                  {`const response = await fetch('https://${typeof window !== "undefined" ? window.location.host : "example.com"}/api/shorten', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com/very-long-url',
  }),
});

const data = await response.json();
console.log(data.shortUrl);`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guidelines */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <ShieldCheck className="mr-2 h-5 w-5" /> Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-5 list-disc space-y-1 text-sm">
              <li>
                Never share your API keys in public repositories or client-side
                code
              </li>
              <li>
                Set expirations for keys when possible to limit risk if
                compromised
              </li>
              <li>
                Revoke keys immediately if they are no longer needed or exposed
              </li>
              <li>
                Use different keys for different applications or environments
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link
              href="/api-docs"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View complete API documentation →
            </Link>
          </CardFooter>
        </Card>

        {/* Revoke confirmation dialog */}
        <AlertDialog
          open={!!keyToRevoke}
          onOpenChange={(open) => !open && setKeyToRevoke(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Revoke API Key?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The API key will be immediately
                revoked and any applications using it will lose access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => keyToRevoke && handleRevokeKey(keyToRevoke)}
              >
                Revoke Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
