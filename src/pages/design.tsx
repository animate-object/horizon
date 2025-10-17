import Layout from "@/shared/components/design/layout";
import Paper from "@/shared/components/design/Paper";
import Text from "@/shared/components/design/Text";
import ReactDOM from "react-dom/client";

function Design() {
  return (
    <Layout>
      <Paper>
        <Text.Header>Design playground</Text.Header>
        <Text.Body>
          This page is for laying out and testing design components
        </Text.Body>
      </Paper>
      <Paper>
        <Text.Header>Text Styles (this is a header)</Text.Header>
        <Text.SubHeader>This is a sub header</Text.SubHeader>
        <Text.SectionHeader>This is a section header</Text.SectionHeader>
        <Text.Body>
          This is body text. Body text tends to be content heavy. It conveys a
          lot of meaning and sometimes can seem to go on and on.
        </Text.Body>
        <a href="?test-1">This is a link</a>
        <Text.Header>
          <a href="?test-2">A link can go in a header</a>
        </Text.Header>
        <Text.Body>
          A <a href="?test-3">link</a> can go in body text
        </Text.Body>
      </Paper>
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Design />);
