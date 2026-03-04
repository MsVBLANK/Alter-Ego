/**
 * Converts a string representation of procedural selections into a map of procedural selections.
 * @param input - A string containing procedural selections. Must contain a string within parentheses. Multiple selections must be separated by a `+`. E.g. `(color=metal + species=upa)`
 * @returns A map of procedural selections, where the key is the name of the procedural and the value is the name of the selected poss.
 */
export function parseProceduralSelections(input: string): Map<string, string> {
    const proceduralSelections = new Map<string, string>();
    if (!input.includes('(') || !input.includes(')') || input.indexOf('(') > input.indexOf(')'))
        throw new SyntaxError("Procedural selections must be contained inside parentheses.");
    const proceduralString = input.substring(input.indexOf('(') + 1, input.indexOf(')'));
    const proceduralList = proceduralString.split('+');
    for (const procedural of proceduralList) {
        const proceduralAssignment = procedural.split('=');
        if (proceduralAssignment.length !== 2)
            throw new SyntaxError("Procedural options must be separated with `+`, and the name of the poss to select must be assigned to the name of its containing procedural with `=`.");
        proceduralSelections.set(proceduralAssignment[0].toLowerCase().trim(), proceduralAssignment[1].toLowerCase().trim())
    }
    return proceduralSelections;
}