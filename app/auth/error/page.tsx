import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense, Fragment } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <Fragment>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Código de error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Un error inesperado ocurrió.
        </p>
      )}
    </Fragment>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <Fragment>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Algo salió mal.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </Fragment >
  );
}
