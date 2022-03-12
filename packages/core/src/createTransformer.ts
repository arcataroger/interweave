import { CommonInternals, Node, OnAfterParse, OnBeforeParse, TagName, WildTagName } from './types';

export type InferElement<K> = K extends '*'
	? HTMLElement
	: K extends keyof HTMLElementTagNameMap
	? HTMLElementTagNameMap[K]
	: HTMLElement;

export type TransformerFactory<Element, Props> = (
	element: Element,
	props: Props,
	children: Node[],
) => Element | React.ReactElement | null | undefined | void;

export interface TransformerOptions<Props, Options = {}> {
	tagName?: TagName;
	onAfterParse?: OnAfterParse<Props>;
	onBeforeParse?: OnBeforeParse<Props>;
	options?: Options;
}

export interface Transformer<Element, Props, Options = {}> extends CommonInternals<Props, Options> {
	extend: (
		factory?: TransformerFactory<Element, Props> | null,
		options?: Partial<TransformerOptions<Props, Options>>,
	) => Transformer<Element, Props, Options>;
	factory: TransformerFactory<Element, Props>;
	tagName: WildTagName;
}

export function createTransformer<K extends WildTagName, Props = {}, Options = {}>(
	tagName: K,
	options: TransformerOptions<Props, Options>,
	factory: TransformerFactory<InferElement<K>, Props>,
): Transformer<InferElement<K>, Props, Options> {
	return {
		extend(customFactory, customOptions) {
			return createTransformer(
				tagName,
				{
					...options,
					...customOptions,
				},
				customFactory ?? factory,
			);
		},
		factory,
		onAfterParse: options.onAfterParse,
		onBeforeParse: options.onBeforeParse,
		options: options.options ?? {},
		tagName: options.tagName ?? tagName,
	};
}
