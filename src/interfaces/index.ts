import type { ConfigurationBuilderResult } from '~types';


export interface IConfigurationBuilder {
    /**
     * Builds configuration.
     */
    build(): Promise<ConfigurationBuilderResult>;
}
