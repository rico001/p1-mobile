import { shallowEqual, useSelector } from 'react-redux';
import { PrintError } from './PrintError';

export const PrintErrorCheck = ({ children }) => {
    console.log('rendering PrintErrorCheck');

  const {
    gcodeFile,
    printError
  } = useSelector(
    state => ({
      gcodeFile: state.printer.gcodeFile,
      printError: state.printer.printError,
    }),
    shallowEqual
  );


    if (!printError.error_code_hex) {
        return <>{children}</>;
    }

    return (
        <PrintError
            code={printError.error_code_hex}
            message={printError.error_message}
            infoLink="https://wiki.bambulab.com/en/hms/error-code"
        />
    );
};
