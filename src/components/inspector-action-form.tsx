"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ActionPostResponse, LinkedAction, parseURL } from "@solana/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InspectorRow, InspectorRowStatus } from "./inspector-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ActionCORSError,
  InspectorPayload,
  InspectorRequest,
  inspectPost,
} from "@/lib/inspector";
import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CornerDownRightIcon,
} from "lucide-react";
import { JsonCodeBlock } from "./json-code-block";

export function InspectorActionForm({
  id,
  linkedAction,
  apiEndpoint,
  getEndpointUrl,
}: {
  linkedAction: LinkedAction;
  apiEndpoint: string;
  getEndpointUrl: URL;
  id: number;
}) {
  const DEFAULT_RESPONSE_OBJECT: InspectorRequest<ActionPostResponse> = {
    checked: false,
    status: 0,
    url: getEndpointUrl,
    corsAccessible: false,
    structured: false,
    data: undefined,
    headers: undefined,
  };

  const params = useSearchParams();

  const [showMoreData, setShowMoreData] = useState(true);
  const [showMoreHeaders, setShowMoreHeaders] = useState(false);

  // const [hasCorsError, setHasCorsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [postResponse, setPostResponse] = useState<
    NonNullable<InspectorPayload["postResponse"]>
  >(DEFAULT_RESPONSE_OBJECT);

  const url: URL | false = useMemo(
    () =>
      !!params.get("url")
        ? new URL(decodeURIComponent(params.get("url")!))
        : false,
    [params],
  );

  const formSchema = z.object({
    account: z.string(),
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
  });

  type FormInput = z.infer<typeof formSchema>;

  // 1. Define your form.
  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      account: Keypair.generate().publicKey.toBase58(),
    },
  });

  // 2. Define a submit handler.
  // async function onSubmit(values: FormInput) {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    // setPostResponse(DEFAULT_RESPONSE_OBJECT);

    if (!url) {
      alert("no 'url' was found");
      return;
    }

    const values = form.getValues();

    // compute the final api url based on the user input
    let apiUrl = apiEndpoint;

    linkedAction.parameters?.map((param) => {
      // replace any string literals
      const template = "{" + param.name + "}";
      // @ts-ignore
      const value: string = values[param.name] || template;

      // replace template literals
      if (apiUrl.includes(template) || apiUrl.includes(encodeURI(template))) {
        apiUrl = apiUrl.replaceAll(template, value);
        apiUrl = apiUrl.replaceAll(encodeURI(template), value);
      }
    });

    console.log("apiUrl:", apiUrl);

    try {
      const res = await inspectPost(apiUrl, {
        account: values.account,
      });

      console.log("got this response");
      console.log(res);

      setPostResponse(res);
    } catch (err) {
      if (err instanceof ActionCORSError) {
        // setHasCorsError(true);
      }
      console.error("[inspectPost]", "[unknown error]", err);
    }

    if (!postResponse.structured) {
      setShowMoreData(true);
      // setShowMoreHeaders(true);
    }

    setLoading(false);
  }

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={(e) => onSubmit(e)}
          // className="space-y-8"
          aria-disabled={loading}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Action #{id + 1}</CardTitle>
              {/* <InspectorRowStatus
                status={
                  linkedAction.href == postResponse.url.toString()
                    ? "valid"
                    : "error"
                }
              /> */}
            </div>
          </CardHeader>

          <CardContent className="w-full space-y-3">
            <Table
              className="max-w-full overflow-hidden"
              parentClassName="relative w-full overflow-auto"
            >
              {/* <TableHeader className="w-full">
                <TableRow>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead className="w-full">Value</TableHead>
                </TableRow>
              </TableHeader> */}
              <TableBody className="max-w-full w-full overflow-hidden">
                <TableRow className="w-full">
                  <TableCell className="font-medium">label</TableCell>
                  <TableCell className="w-full">{linkedAction.label}</TableCell>
                </TableRow>
                <TableRow className="w-full">
                  <TableCell className="font-medium">href</TableCell>
                  <TableCell className="w-full">{linkedAction.href}</TableCell>
                </TableRow>
                <TableRow className="w-full">
                  <TableCell className="font-medium whitespace-nowrap">
                    mapped to
                  </TableCell>
                  <TableCell className="w-full">
                    {apiEndpoint || "[err] no mapping url found"}
                    {/* {decodeURI(postResponse.url.toString()) ||
                      "[err] no mapping url found"} */}

                    {/* {!!postResponse?.mappedUrl
                      ? decodeURI(postResponse.mappedUrl.toString())
                      : "[err] no mapping url found"} */}
                  </TableCell>
                </TableRow>

                {linkedAction.parameters ? (
                  <TableRow className="w-full">
                    <TableCell colSpan={2} className="w-full space-y-3">
                      <p className="font-medium">
                        parameters: {linkedAction.parameters.length}
                      </p>

                      <Table className="border w-full">
                        <TableHeader className="w-full border-b">
                          <TableRow>
                            <TableHead className="w-[150px]">Index</TableHead>
                            <TableHead className="w-[300px]">Field</TableHead>
                            <TableHead className="w-full">Value</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody className="max-w-full w-full overflow-hidden">
                          {linkedAction.parameters.map((param, key) => (
                            <Fragment key={key}>
                              <TableRow className="w-full pointer-events-none">
                                <TableCell
                                  rowSpan={2}
                                  className="font-medium border-r"
                                >
                                  #{key}
                                </TableCell>
                                <TableCell className="font-medium border-r">
                                  name
                                </TableCell>
                                <TableCell className="w-full">
                                  {param.name}
                                </TableCell>
                              </TableRow>
                              <TableRow className="w-full pointer-events-none">
                                <TableCell className="font-medium border-r">
                                  label
                                </TableCell>
                                <TableCell className="w-full">
                                  {param.label || "no 'label' set"}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow className="w-full">
                    <TableCell className="font-medium">parameters</TableCell>
                    <TableCell className="w-full">none detected</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <CardContent className="w-full space-y-3 border-t pt-6">
            <CardTitle>Test this Action</CardTitle>

            <FormField
              control={form.control}
              name="account"
              disabled={loading}
              aria-disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        "Account address that is expected to sign the transaction"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {/* Required: {param.required || false} */}
                    {/* This is your public display name. */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {linkedAction.parameters?.map((param, key) => (
              <FormField
                key={key}
                control={form.control}
                // @ts-expect-error
                name={param.name}
                disabled={loading}
                aria-disabled={loading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {param.name || "[error: no 'name' field]"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          param.label ||
                          "[no placeholder text set via the 'label' field]"
                        }
                        {...field}
                      />
                    </FormControl>
                    {/* <FormDescription>
                      Required: {param.required || false}
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit" disabled={loading} aria-disabled={loading}>
              Submit: {String(linkedAction.label)}
            </Button>
          </CardContent>

          {postResponse.checked && (
            <CardContent className="">
              <Table className="">
                {/* <TableCaption>
                Read the{" "}
                <Link
                  href={siteConfig.links.docs}
                  className="underline hover:text-primary"
                >
                  Solana Actions
                </Link>{" "}
                documentation for more details
              </TableCaption> */}
                <TableHeader className="w-full">
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-full">Name</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="max-w-full w-full overflow-hidden">
                  <InspectorRow
                    name={"Cross-Origin Resource Headers"}
                    status={postResponse?.corsAccessible ? "valid" : "error"}
                  />
                  <InspectorRow
                    name={`HTTP status code of ${
                      postResponse?.status || "[unknown]"
                    }`}
                    status={postResponse?.status == 200 ? "valid" : "error"}
                  />
                  <InspectorRow
                    name={"Valid structure of the returned data"}
                    status={postResponse?.structured ? "valid" : "error"}
                  />

                  {!!postResponse?.corsAccessible && (
                    <>
                      <TableRow className="">
                        <TableCell className="font-medium text-end flex items-center justify-end">
                          <CornerDownRightIcon
                            strokeWidth={1.4}
                            className="size-5"
                          />
                        </TableCell>
                        <TableCell colSpan={2} className="!py-3">
                          <div className="flex items-center justify-between">
                            <h5>Response data </h5>
                            <Button
                              type="button"
                              variant={"link"}
                              size={"sm"}
                              className={"underline inline-flex gap-2"}
                              onClick={() => setShowMoreData(!showMoreData)}
                            >
                              {showMoreData ? (
                                <>
                                  show less{" "}
                                  <ChevronUpIcon
                                    strokeWidth={1.4}
                                    className="size-5"
                                  />
                                </>
                              ) : (
                                <>
                                  show more{" "}
                                  <ChevronDownIcon
                                    strokeWidth={1.4}
                                    className="size-5"
                                  />
                                </>
                              )}
                            </Button>
                          </div>

                          <JsonCodeBlock
                            data={postResponse.data}
                            showMore={showMoreData}
                            errorMessage={"[no data found]"}
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow className="">
                        <TableCell className="font-medium text-end flex items-center justify-end">
                          <CornerDownRightIcon
                            strokeWidth={1.4}
                            className="size-5"
                          />
                        </TableCell>
                        <TableCell colSpan={2} className="!py-3">
                          <div className="flex items-center justify-between">
                            <h5>Response headers </h5>
                            <Button
                              type="button"
                              variant={"link"}
                              size={"sm"}
                              className={"underline inline-flex gap-2"}
                              onClick={() =>
                                setShowMoreHeaders(!showMoreHeaders)
                              }
                            >
                              {showMoreHeaders ? (
                                <>
                                  show less{" "}
                                  <ChevronUpIcon
                                    strokeWidth={1.4}
                                    className="size-5"
                                  />
                                </>
                              ) : (
                                <>
                                  show more{" "}
                                  <ChevronDownIcon
                                    strokeWidth={1.4}
                                    className="size-5"
                                  />
                                </>
                              )}
                            </Button>
                          </div>

                          <JsonCodeBlock
                            data={postResponse.headers as any}
                            showMore={showMoreHeaders}
                            errorMessage={"[no headers found]"}
                          />
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </form>
      </Form>
    </Card>
  );
}
