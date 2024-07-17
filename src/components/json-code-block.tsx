import { cn } from "@/lib/utils";

export function JsonCodeBlock({
  data,
  showMore,
  errorMessage,
}: {
  data?: object | string;
  showMore: boolean;
  errorMessage: string;
}) {
  if (!!data && typeof data == "string") {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.log("[error] unable to parse 'data' as json");
    }
  }

  return (
    <pre
      className={cn(
        "border p-3 bg-secondary my-4 rounded-lg overflow-x-auto max-w-2xl w-full",
        !showMore && "hidden",
      )}
    >
      {data ? JSON.stringify(data, null, "\t") : errorMessage}
    </pre>
  );
}
