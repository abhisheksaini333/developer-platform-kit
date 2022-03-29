FROM mcr.microsoft.com/dotnet/sdk:6.0.201-alpine3.15 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Service.csproj -c Release -o /out --no-self-contained
FROM mcr.microsoft.com/dotnet/aspnet:6.0.3-alpine3.15
RUN addgroup -g 10001 app && adduser -D -u 10001 -G app app
WORKDIR /app
COPY --from=build --chown=app:app /out .
ENV ASPNETCORE_URLS=http://+:__PORT__ DOTNET_EnableDiagnostics=0
USER app
EXPOSE __PORT__
ENTRYPOINT ["dotnet", "__NAME__.dll"]
