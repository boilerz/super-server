import { Query, Resolver } from 'type-graphql';

@Resolver()
class DummyResolver {
  @Query(() => String)
  yo(): string {
    return 'Yo';
  }
}

export default DummyResolver;
