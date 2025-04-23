"use client";

import { useState, useMemo, useCallback } from "react";
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
import { toast } from "sonner";
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
  CheckIcon,
  MoreVertical,
  CalendarIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyManager({ open, onOpenChange }: ApiKeyManagerProps) {
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(
    undefined,
  );
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: apiKeys, refetch } = api.apiKey.getUserApiKeys.useQuery();
  const createKeyMutation = api.apiKey.createApiKey.useMutation({
    onSuccess: (data) => {
      setNewKeyValue(data.key);
      setIsCreatingNew(false);
      refetch();
    },
  });
  const revokeKeyMutation = api.apiKey.revokeApiKey.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateKey = useCallback(() => {
    if (newKeyName.trim() === "") return;
    createKeyMutation.mutate({
      name: newKeyName,
      expiresInDays,
    });
    setNewKeyName("");
    setExpiresInDays(undefined);
  }, [createKeyMutation, newKeyName, expiresInDays]);

  const handleRevokeKey = useCallback(
    (id: string) => {
      revokeKeyMutation.mutate({ id });
      setKeyToRevoke(null);
    },
    [revokeKeyMutation],
  );

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    toast("API key copied", {
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    });
    // Reset copied state after a short delay
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setExpiresInDays(value === "never" ? undefined : Number(value));
  }, []);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }, []);

  const CreateKeyForm = useMemo(() => {
    if (!isCreatingNew || newKeyValue) return null;

    return (
      <Card>
        <CardHeader className="px-4">
          <CardTitle>Create API Key</CardTitle>
          <CardDescription>
            Name your API key and set an optional expiration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4">
          <div>
            <Label htmlFor="name">API Key Name</Label>
            <Input
              id="name"
              placeholder="e.g., iOS Shortcut Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="expires">Expiry Period</Label>
            <Select
              onValueChange={handleSelectChange}
              value={expiresInDays?.toString() || "never"}
              defaultValue="never"
            >
              <SelectTrigger id="expires" className="mt-1 w-full">
                <SelectValue placeholder="Select expiry period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between px-4">
          <Button
            variant="outline"
            onClick={() => setIsCreatingNew(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateKey}
            disabled={createKeyMutation.isPending || newKeyName.trim() === ""}
            size="sm"
          >
            {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
          </Button>
        </CardFooter>
      </Card>
    );
  }, [
    isCreatingNew,
    newKeyValue,
    newKeyName,
    expiresInDays,
    createKeyMutation.isPending,
    handleCreateKey,
    handleSelectChange,
  ]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-full overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyIcon className="mr-2 h-5 w-5" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Create and manage API keys for programmatic access.
          </DialogDescription>
        </DialogHeader>

        {/* Display newly created key */}
        {newKeyValue && (
          <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
            <CardHeader className="px-4 pb-2">
              <CardTitle className="text-sm font-medium">
                New API Key Created
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                Copy this key now. You won&apos;t be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="relative">
                <div className="flex items-center">
                  <Input
                    type={showNewKey ? "text" : "password"}
                    value={newKeyValue}
                    readOnly
                    className="pr-20 text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-12 h-8 w-8"
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
                    className="absolute right-2 h-8 w-8"
                    onClick={() => handleCopyKey(newKeyValue)}
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4">
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

        {CreateKeyForm}

        <Card>
          <CardHeader className="px-4 pb-2">
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Keys are used to authenticate API requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            {apiKeys?.length ? (
              <div>
                <div className="hidden md:block">
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
                </div>

                <div className="space-y-4 md:hidden">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => setKeyToRevoke(apiKey.id)}
                            >
                              Revoke API Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>Created:</span>
                        </div>
                        <span>{formatDate(apiKey.createdAt)}</span>

                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>Last Used:</span>
                        </div>
                        <span>
                          {apiKey.lastUsedAt
                            ? formatDate(apiKey.lastUsedAt)
                            : "Never"}
                        </span>

                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-3.5 w-3.5" />
                          <span>Expires:</span>
                        </div>
                        <span>
                          {apiKey.expiresAt ? (
                            <Badge className="h-5 px-1.5 py-0 text-xs font-normal">
                              {formatDate(apiKey.expiresAt)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 py-0 text-xs font-normal"
                            >
                              Never
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
          <CardFooter className="flex flex-col justify-between gap-3 px-4 sm:flex-row">
            {!isCreatingNew && !newKeyValue && (
              <Button
                onClick={() => setIsCreatingNew(true)}
                className="w-full sm:w-auto"
                size="sm"
              >
                Create New API Key
              </Button>
            )}
            <Link
              href="/api-docs"
              className="self-center text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View API documentation →
            </Link>
          </CardFooter>
        </Card>

        <AlertDialog
          open={!!keyToRevoke}
          onOpenChange={(open) => !open && setKeyToRevoke(null)}
        >
          <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
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
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
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
