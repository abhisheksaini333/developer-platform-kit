FROM node:16.13.1-alpine AS generate
WORKDIR /platform
COPY src/catalog.js src/templates.js ./src/
COPY templates ./templates
RUN node -e "require('./src/templates').generate({name:'ci-dotnet',owner:'platform-team',language:'dotnet'},'/generated')"
FROM mcr.microsoft.com/dotnet/sdk:6.0.201-alpine3.15
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1
WORKDIR /generated
COPY --from=generate /generated ./
RUN dotnet build tests/Smoke.csproj -c Release
CMD ["dotnet","run","--project","tests/Smoke.csproj","-c","Release","--no-build"]
