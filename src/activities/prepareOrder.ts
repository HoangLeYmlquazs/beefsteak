import convert from 'xml-js'

export async function prepareOrder(order: any): Promise<any> {
    var options = { compact: true, ignoreComment: true, spaces: 4 };
    return convert.json2xml(order, options)
}
