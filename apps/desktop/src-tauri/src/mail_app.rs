//! Being the system's email app, which macOS lets only the app ask for and only the user grant.

use block2::RcBlock;
use objc2_app_kit::NSWorkspace;
use objc2_foundation::{NSBundle, NSError, NSString, NSURL};

pub fn is_default() -> bool {
    let Some(mailto) = NSURL::URLWithString(&NSString::from_str("mailto:")) else {
        return false;
    };
    let handler = NSWorkspace::sharedWorkspace().URLForApplicationToOpenURL(&mailto);
    let this = NSBundle::mainBundle().bundleURL();
    handler.is_some_and(|handler| handler.URLByStandardizingPath() == this.URLByStandardizingPath())
}

/** macOS asks the user to confirm; `done` runs once they answered, either way. */
pub fn make_default(done: impl Fn() + 'static) {
    let block = RcBlock::new(move |_error: *mut NSError| done());
    NSWorkspace::sharedWorkspace()
        .setDefaultApplicationAtURL_toOpenURLsWithScheme_completionHandler(
            &NSBundle::mainBundle().bundleURL(),
            &NSString::from_str("mailto"),
            Some(&block),
        );
}
