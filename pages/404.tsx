import Error from "./_error";

function NotFound() {
	return <Error statusCode={404} />;
}

NotFound.getLayout = Error.getLayout;

export default NotFound;
