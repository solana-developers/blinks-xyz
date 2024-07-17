"use client";

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
  inspectActionsJson,
  inspectGet,
  InspectorPayload,
  inspectPost,
} from "@/lib/inspector";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CornerDownRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonCodeBlock } from "./json-code-block";

export function InspectorRow({
  status,
  name,
  children,
  childItems,
  responseData,
  responseHeaders,
  corsAccessible,
}: {
  name: React.ReactNode;
  children?: React.ReactNode;
  status: InspectorRowStatusProps["status"];
  childItems?: Array<InspectorRowChildItem>;
  responseData?: any;
  responseHeaders?: any;
  corsAccessible?: boolean;
}) {
  const [showMoreData, setShowMoreData] = useState(false);
  const [showMoreHeaders, setShowMoreHeaders] = useState(false);

  return (
    <>
      <TableRow className="w-full">
        <TableCell className="font-medium">
          <InspectorRowStatus status={status} />
        </TableCell>
        <TableCell className="w-full" colSpan={2}>
          {name}
        </TableCell>
        {/* <TableCell className="text-right flex justify-center">
          <ChevronDownIcon />
        </TableCell> */}
      </TableRow>

      {childItems?.map((item, key) => (
        <InspectorRowChild key={key} {...item} />
      ))}

      {!!corsAccessible && (
        <>
          <TableRow className="">
            <TableCell className="font-medium text-end flex items-center justify-end">
              <CornerDownRightIcon strokeWidth={1.4} className="size-5" />
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
                      <ChevronUpIcon strokeWidth={1.4} className="size-5" />
                    </>
                  ) : (
                    <>
                      show more{" "}
                      <ChevronDownIcon strokeWidth={1.4} className="size-5" />
                    </>
                  )}
                </Button>
              </div>

              <JsonCodeBlock
                data={responseData}
                showMore={showMoreData}
                errorMessage={"[no data found]"}
              />
            </TableCell>
          </TableRow>

          <TableRow className="">
            <TableCell className="font-medium text-end flex items-center justify-end">
              <CornerDownRightIcon strokeWidth={1.4} className="size-5" />
            </TableCell>
            <TableCell colSpan={2} className="!py-3">
              <div className="flex items-center justify-between">
                <h5>Response headers </h5>
                <Button
                  type="button"
                  variant={"link"}
                  size={"sm"}
                  className={"underline inline-flex gap-2"}
                  onClick={() => setShowMoreHeaders(!showMoreHeaders)}
                >
                  {showMoreHeaders ? (
                    <>
                      show less{" "}
                      <ChevronUpIcon strokeWidth={1.4} className="size-5" />
                    </>
                  ) : (
                    <>
                      show more{" "}
                      <ChevronDownIcon strokeWidth={1.4} className="size-5" />
                    </>
                  )}
                </Button>
              </div>

              <JsonCodeBlock
                data={responseHeaders}
                showMore={showMoreHeaders}
                errorMessage={"[no headers found]"}
              />
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  );
}

export type InspectorRowChildItem = {
  name: string;
  // children?: React.ReactNode;
  status: InspectorRowStatusProps["status"];
};

export function InspectorRowChild({ status, name }: InspectorRowChildItem) {
  return (
    <TableRow className="">
      <TableCell className="font-medium text-end flex items-center justify-end">
        <CornerDownRightIcon strokeWidth={1.4} className="size-5" />
      </TableCell>
      <TableCell className="!py-3">{name}</TableCell>

      <TableCell className="font-medium text-right flex justify-center">
        <InspectorRowStatus status={status} />
      </TableCell>
    </TableRow>
  );
}

export type InspectorRowStatusProps = {
  status: "error" | "valid" | "warning" | "not-tested";
  label?: string;
};

export function InspectorRowStatus({ status, label }: InspectorRowStatusProps) {
  switch (status) {
    case "valid":
      return <Badge variant={"success"}>{label || "Valid"}</Badge>;
    case "error":
      return <Badge variant={"destructive"}>{label || "Error"}</Badge>;
    case "warning":
      return <Badge variant={"warning"}>{label || "Warning"}</Badge>;
    case "not-tested":
      return <Badge variant={"outline"}>{label || "Not Tested"}</Badge>;
    default:
      return <Badge variant={"default"}>{label || "Unknown"}</Badge>;
  }
}
