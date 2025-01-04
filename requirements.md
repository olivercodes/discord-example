## Discord bot design

### Architectural questions

- What areas can we expect to change over tme?

1. How it is deployed
2. Who is using it (i.e. other servers)
3. Who is maintaining it
4. How it is monitored
5. Network config

### Requirements

- Get a list of users that don't have n...n+1 roles
- Remove users that don't have n...n+1 roles

### ADRs

Use Express to receive http requests
- We dont' kow how requests will get to the application, so express is a predictable standard we can expose

Containerized
- The app might be on Rpi, Kubernetes, Lambda, Fargate, etc. Point being, it's deployment location is likely to change as it grows and/or changes hands.
- Container allows to do all of them without changes to the app

Parameterized commands/apis
- While requirements are presently for one specific role, it's reasonable to expect other roles may be used
- It's also possible we'll want to look for users who don't have multiple (like a set of) roles

Monitoring: OTEL
- We will use opentelemetry for monitoring. This fits within our decision to deploy to many different environments

Maintainability
- Using Vault or 1Password to maange secrets will make it easy to handoff management of the application to other people
- Leverage secrets injection to simplify how the application receives and uses secrets

Who: Any Server
- We will assume that any server may use the application. This allows us to create new servers in the future and use the same bot (i.e. the Yard moving to GTA6)
