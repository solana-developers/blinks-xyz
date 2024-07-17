"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ActionCORSError,
  inspectActionsJson,
  inspectGet,
  InspectorPayload,
  linkedActionHref,
} from "@/lib/inspector";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { InspectorActionForm } from "./inspector-action-form";
import { InspectorRow } from "./inspector-table";
import { ActionsURLMapper } from "@/lib/actionsJsonMapper";
import { ActionsJson, BlinkURLFields, parseURL } from "@solana/actions";

export function InspectorForm({ className }: { className?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const [inputText, setInputText] = useState(params.get("url") || "");
  const [hasCorsError, setHasCorsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [inspector, setInspector] = useState<InspectorPayload | null>(null);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isBlink = false;

    try {
      let parsedUrl = parseURL(inputText);
      console.log("parsedUrl input:", parsedUrl);

      if (!!(parsedUrl as BlinkURLFields)?.blink) {
        isBlink = true;
        router.push(
          `/inspector?url=${encodeURIComponent(
            (parsedUrl as BlinkURLFields).action.link.toString(),
          )}`,
          {},
        );
      }
    } catch (err) {}

    if (!isBlink) {
      router.push(`/inspector?url=${encodeURIComponent(inputText)}`, {});
    }
  };

  const url: URL | false = useMemo(
    () =>
      !!params.get("url")
        ? new URL(decodeURIComponent(params.get("url")!))
        : false,
    [params],
  );

  async function inspectBlinkUrl(url: URL) {
    if (loading) return;

    setLoading(true);
    setInspector(null);

    const payload: InspectorPayload = {
      actionsJson: undefined,
      getResponse: undefined,
      // postResponse: undefined,
      mappedActionsJsonUrl: new URL("actions.json", url.origin),
      mappedGetUrl: url,
    };

    try {
      // todo: if not http or https
      // todo: should this also support solana: and solana-action: ??

      payload.actionsJson = await inspectActionsJson(
        payload.mappedActionsJsonUrl,
      );
    } catch (err) {
      if (err instanceof ActionCORSError) {
        setHasCorsError(true);
      }
      console.error("[inspectActionsJson]", "[unknown error]", err);
    }

    // map the GET endpoint via actions.json
    if (
      payload.actionsJson?.data &&
      typeof payload.actionsJson.data != "string"
    ) {
      const actionsUrlMapper = new ActionsURLMapper(
        payload.actionsJson.data as ActionsJson,
      );

      const mappedUrl = actionsUrlMapper.mapUrl(url);
      if (mappedUrl) {
        payload.mappedGetUrl = mappedUrl;
      }
    }

    try {
      payload.getResponse = await inspectGet(payload.mappedGetUrl);
    } catch (err) {
      if (err instanceof ActionCORSError) {
        setHasCorsError(true);
      }
      console.error("[inspectGet]", "[unknown error]", err);
    }

    // try {
    //   payload.postResponse = await inspectPost(url, {
    //     account: "7igbU6EsyjtqryUispbReSnbkZVXTDskQmsFPyh38u6E",
    //   });
    // } catch (err) {
    //   if (err instanceof ActionCORSError) {
    //     setHasCorsError(true);
    //   }
    //   console.error("[inspectPost]", "[unknown error]", err);
    // }

    setInspector(payload);
    setLoading(false);
  }

  useEffect(() => {
    if (!url) return console.log("no url found yet");
    inspectBlinkUrl(url);
  }, [url]);

  return (
    <section className={className}>
      <form
        onSubmit={submitHandler}
        className="grid md:flex items-center gap-4 max-w-screen-sm mx-auto py-4"
        aria-disabled={loading}
      >
        <Input
          type="url"
          required={true}
          value={inputText}
          name="action"
          onChange={(e) => {
            setInputText(e.target.value);
          }}
          placeholder="Enter a URL..."
          className="min-w-96"
          disabled={loading}
          aria-disabled={loading}
        />
        <Button type="submit" disabled={loading} aria-disabled={loading}>
          Inspect
        </Button>
      </form>

      {/* <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Overview</TabsTrigger>
          <TabsTrigger value="password">Actions (3)</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs> */}

      <section className="container max-w-4xl my-12 space-y-10">
        {inspector && (
          <>
            {/* <JsonCodeBlock
              data={inspector}
              showMore={true}
              errorMessage={"[no 'inspector' found]"}
            /> */}

            <Table
              className=""
              // parentClassName="relative w-full overflow-auto"
            >
              <TableHeader className="w-full">
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-full">Name</TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="max-w-full w-full overflow-hidden">
                <InspectorRow
                  name={
                    <>
                      <p>actions.json file</p>
                      <p className="block text-muted-foreground max-w-full  text-sm">
                        {inspector.mappedActionsJsonUrl.toString() ||
                          "[err] no actions.json url found"}
                      </p>
                    </>
                  }
                  corsAccessible={inspector.actionsJson?.corsAccessible}
                  status={
                    inspector.actionsJson?.corsAccessible &&
                    inspector.actionsJson?.status == 200 &&
                    inspector.actionsJson?.structured
                      ? "valid"
                      : "error"
                  }
                  responseData={inspector.actionsJson?.data}
                  responseHeaders={inspector.actionsJson?.headers}
                  childItems={
                    !inspector.actionsJson?.corsAccessible
                      ? [
                          {
                            name: "Cross-Origin Resource Headers",
                            status: inspector.actionsJson?.corsAccessible
                              ? "valid"
                              : "error",
                          },
                        ]
                      : [
                          {
                            name: "Cross-Origin Resource Headers",
                            status: inspector.actionsJson?.corsAccessible
                              ? "valid"
                              : "error",
                          },
                          {
                            name: `HTTP status code of ${
                              inspector.actionsJson?.status || "[err]"
                            }`,
                            status:
                              inspector.actionsJson?.status == 200
                                ? "valid"
                                : "error",
                          },
                          {
                            name: "Validate structure of the returned data",
                            status: inspector.actionsJson?.structured
                              ? "valid"
                              : "error",
                          },
                        ]
                  }
                ></InspectorRow>

                <InspectorRow
                  name={
                    <>
                      <p>GET endpoint and response</p>
                      <p className="text-muted-foreground text-sm line-clamp-1">
                        {inspector?.mappedGetUrl?.toString() ||
                          inspector.getResponse?.url.toString() ||
                          "[err] no GET endpoint url found"}
                      </p>
                    </>
                  }
                  corsAccessible={inspector.getResponse?.corsAccessible}
                  status={
                    inspector.getResponse?.corsAccessible &&
                    inspector.getResponse?.status == 200 &&
                    inspector.getResponse?.structured
                      ? "valid"
                      : "error"
                  }
                  responseData={inspector.getResponse?.data}
                  responseHeaders={inspector.getResponse?.headers}
                  childItems={
                    !inspector.getResponse?.corsAccessible
                      ? [
                          {
                            name: "Cross-Origin Resource Headers",
                            status: inspector.getResponse?.corsAccessible
                              ? "valid"
                              : "error",
                          },
                        ]
                      : [
                          {
                            name: !!inspector.mappedGetUrl
                              ? "Mapped via actions.json to create blinks"
                              : "NOT mapped via actions.json - No blink will be displayed",
                            status: inspector.mappedGetUrl
                              ? "valid"
                              : "warning",
                          },
                          {
                            name: "Cross-Origin Resource Headers",
                            status: inspector.getResponse?.corsAccessible
                              ? "valid"
                              : "error",
                          },
                          {
                            name: `HTTP status code of ${
                              inspector.getResponse?.status || "[err]"
                            }`,
                            status:
                              inspector.getResponse?.status == 200
                                ? "valid"
                                : "error",
                          },
                          {
                            name: "Validate structure of the returned data",
                            status: inspector.getResponse?.structured
                              ? "valid"
                              : "error",
                          },
                        ]
                  }
                ></InspectorRow>
              </TableBody>
            </Table>

            {!!inspector?.getResponse?.data &&
              inspector.getResponse.url &&
              typeof inspector.getResponse.data != "string" && (
                <div className="space-y-4">
                  {/* <Table className="">
                    <TableCaption>
                      Read the{" "}
                      <Link
                        href={siteConfig.links.docs}
                        className="underline hover:text-primary"
                      >
                        Solana Actions
                      </Link>{" "}
                      documentation for more details
                    </TableCaption>
                    <TableHeader className="w-full">
                      <TableRow>
                        <TableHead className="w-[100px]">Field</TableHead>
                        <TableHead className="w-full">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="max-w-full w-full overflow-hidden">
                      <TableRow className="w-full">
                        <TableCell className="font-medium">icon</TableCell>
                        <TableCell className="w-full">
                          {inspector.getResponse.data.icon}
                        </TableCell>
                      </TableRow>
                      <TableRow className="w-full">
                        <TableCell className="font-medium">title</TableCell>
                        <TableCell className="w-full">
                          {inspector.getResponse.data.title}
                        </TableCell>
                      </TableRow>
                      <TableRow className="w-full">
                        <TableCell className="font-medium">
                          description
                        </TableCell>
                        <TableCell className="w-full">
                          {inspector.getResponse.data.description}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table> */}

                  {inspector.getResponse.data.links?.actions ? (
                    inspector.getResponse.data.links?.actions.map(
                      (linkedAction, key) => {
                        return (
                          <InspectorActionForm
                            key={key}
                            id={key}
                            getEndpointUrl={inspector.getResponse!.url}
                            apiEndpoint={linkedActionHref(
                              linkedAction.href,
                              inspector.getResponse!.url,
                            )}
                            linkedAction={linkedAction}
                          />
                        );
                      },
                    )
                  ) : (
                    <InspectorActionForm
                      id={0}
                      getEndpointUrl={inspector.getResponse!.url}
                      // v1 actions do not have the ability declare a `href` value,
                      //so the it becomes the same URL as the GET request
                      apiEndpoint={inspector.getResponse!.url.toString()}
                      linkedAction={{
                        // v1 actions do not have the ability declare a `href` value,
                        //so the it becomes the same URL as the GET request
                        href: inspector.getResponse!.url.toString(),
                        label: inspector.getResponse.data.label,
                        parameters: undefined,
                      }}
                    />
                  )}

                  {/* <pre className="border p-3 bg-secondary my-4">
                    {JSON.stringify(inspector.getResponse.data, null, "\t")}
                  </pre> */}
                </div>
              )}
          </>
        )}
      </section>
    </section>
  );
}
