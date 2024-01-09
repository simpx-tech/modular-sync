/**
 * Conditionally selects one type, if "A" is unknown, it selects the other type ("B")
 */
type UseAOrB<TA = any, TB = any> = TA extends undefined ? TB : TA;