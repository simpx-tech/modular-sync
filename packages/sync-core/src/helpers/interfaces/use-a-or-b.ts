/**
 * Conditionally selects one type, if "A" is unknown, it selects the other type ("B")
 */
export type UseAOrB<TA, TB> = TA extends undefined ? TB : TA;