import type { ConfigurationBuilderResult } from '~types';


export interface IConfigurationBuilder {
    build(): Promise<ConfigurationBuilderResult>;
}
