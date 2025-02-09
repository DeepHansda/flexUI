import CodePreviewComponet from "@/components/CodeComponets/CodePreviewComponet";
import MDXComponent from "@/components/MDXComponent";
import request from "@/utils/AxiosUtils";
import { GET_ELEMENT_DETAILS } from "@/utils/AxiosUtils/api";
import "highlight.js/styles/night-owl.css";
import ElementComponent from "./ElementComponent";

// interface FrontMatter {
//   title: string;
// }

// interface ElementData {
//   mdxSource: string;
// }

// async function getElementData(element: string): Promise<ElementData> {
//   const data = await request({"url":`${GET_ELEMENT_DETAILS}/${element}`,"method":"GET"});

//   const mdxSource = data?.docs;

//   // // Serialize MDX content
//   // const mdxSource = await serialize(data?.docs, {
//   //   mdxOptions: {
//   //     remarkPlugins: [remarkGfm],
//   //     rehypePlugins: [rehypeHighlight],
//   //   },
//   //   scope: data.frontMatter || {},
//   // });

//   // console.log(mdxSource);
//   return {mdxSource}
// }

export default async function ComponentPage({
  component,
}: {
  component: string;
}) {
  const data = await request({
    url: `${GET_ELEMENT_DETAILS}/${component}`,
    method: "GET",
  });
  return (
    
    <div>
      <div>
        <div>
          <h1 className="font-bold text-4xl">{data?.uiName}</h1>
          <p className="text-md font-semibold my-2">{data?.uiSubtitle}</p>
        </div>
        <div>
          <CodePreviewComponet
            codeList={data?.codes}
            elementTitle={data?.uiName}
          />
        </div>

        <div>
          <MDXComponent mdxText={data?.docs} />
        </div>
      </div>
      {data?.uiVariants &&
        data?.uiVariants?.length > 0 &&
        data?.uiVariants?.map(
          (item: Record<string, unknown>, index: number) => (
            <ElementComponent key={index} data={item} />
          )
        )}
    </div>
  );
}
