import { path, dejs, Context } from "../deps.ts";
import { formatError } from "../util/console.util.ts";

const _dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * @desc converts a `Deno.reader` to string format
 */
const toString = async (reader: Deno.Reader): Promise<string> =>
  new TextDecoder().decode(await Deno.readAll(reader));

/**
 * @classdesc this 'Template' is a helper class so we can more easily render templates
 */
class Template {
  /**
   * @desc read the content of a template as a string
   */
  async read(file: string, data: object = {}): Promise<string> {
    const absoluteFilePath = path.join(
      _dirname,
      "../views",
      file,
    );
    return await toString(await dejs.renderFile(absoluteFilePath, data));
  }

  /**
   * @desc render a view
   * @param {string} filename - the filename of the template. ex. './home.ejs or 'about.ejs'
   * these are resolves relative to the 'views' directory of this project
   * @param {object} data - any data you want to pass to the template for render
   */
  async render(ctx: Context, file: string, data: object = {}): Promise<void> {
    try {
      const htmlString = await this.read(file, data);
      // required because https://github.com/oakserver/oak/blob/d866c1baefd112ecfacf54412d1529942a5896f8/util.ts#L18
      // has false negatives (albeit rare)
      const headers = new Headers();
      headers.append("content-type", "text/html");

      ctx.response.headers = headers;
      ctx.response.status = 200;
      ctx.response.body = htmlString;
    } catch (err) {
      console.error(formatError(err.stack));
      // const headers = new Headers()
      // headers.append('content-type', 'text/html')

      // TODO: bypass oak writing 'Internal Server Error' if possible
      // ctx.response.headers = headers
      // ctx.response.body = err.toString()
      // ctx.response.body = "foo"
    }
  }
}

const template = new Template();
export { template as Template };
