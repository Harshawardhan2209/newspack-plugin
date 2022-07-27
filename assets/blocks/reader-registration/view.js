/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/dom-ready/
 *
 * @param {Function} callback A function to execute after the DOM is ready.
 * @return {void}
 */
function domReady( callback ) {
	if ( typeof document === 'undefined' ) {
		return;
	}
	if (
		document.readyState === 'complete' || // DOMContentLoaded + Images/Styles/etc loaded, so we call directly.
		document.readyState === 'interactive' // DOMContentLoaded fires at this point, so we call directly.
	) {
		return void callback();
	}
	// DOMContentLoaded has not fired yet, delay callback until then.
	document.addEventListener( 'DOMContentLoaded', callback );
}

const convertFormDataToObject = ( formData, ignoredKeys = [] ) =>
	Array.from( formData.entries() ).reduce( ( acc, [ key, val ] ) => {
		if ( ignoredKeys.includes( key ) ) {
			return acc;
		}
		if ( key.indexOf( '[]' ) > -1 ) {
			key = key.replace( '[]', '' );
			acc[ key ] = acc[ key ] || [];
			acc[ key ].push( val );
		} else {
			acc[ key ] = val;
		}
		return acc;
	}, {} );

( function ( readerActivation ) {
	domReady( function () {
		if ( ! readerActivation ) {
			return;
		}
		document.querySelectorAll( '.newspack-registration' ).forEach( container => {
			const form = container.querySelector( 'form' );
			if ( ! form ) {
				return;
			}

			const messageElement = container.querySelector( '.newspack-registration__response' );
			const submitElement = form.querySelector( 'input[type="submit"]' );
			const successElement = container.querySelector( '.newspack-registration__success' );

			readerActivation.on( 'reader', ( { detail: { authenticated } } ) => {
				if ( authenticated ) {
					form.style.display = 'none';
				}
			} );

			const startLoginFlow = () => {
				messageElement.innerHTML = '';
				submitElement.disabled = true;
				container.classList.add( 'newspack-registration--in-progress' );
			};

			const endLoginFlow = ( message, status, data ) => {
				let messageNode;
				if ( message ) {
					messageNode = document.createElement( 'div' );
					messageNode.textContent = message;
				}
				const isSuccess = status === 200;
				container.classList.add( `newspack-registration--${ isSuccess ? 'success' : 'error' }` );
				if ( isSuccess ) {
					if ( messageNode ) {
						successElement.classList.remove( 'newspack-registration--hidden' );
						form.remove();
					}
					if ( data?.email ) {
						readerActivation.setReaderEmail( data.email );
						// Set authenticated only if email is set, otherwise an error will be thrown.
						readerActivation.setAuthenticated( data?.authenticated );
					}
				} else if ( messageNode ) {
					messageElement.appendChild( messageNode );
				}
				submitElement.disabled = false;
				container.classList.remove( 'newspack-registration--in-progress' );
			};

			form.addEventListener( 'submit', ev => {
				ev.preventDefault();
				const body = new FormData( form );
				if ( ! body.has( 'email' ) || ! body.get( 'email' ) ) {
					return;
				}
				startLoginFlow();
				fetch( form.getAttribute( 'action' ) || window.location.pathname, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
					},
					body,
				} )
					.then( res => {
						res.json().then( ( { message, data } ) => endLoginFlow( message, res.status, data ) );
					} )
					.finally( endLoginFlow );
			} );

			const googleLoginElement = container.querySelector(
				'.newspack-registration__logins__google'
			);
			if ( googleLoginElement ) {
				googleLoginElement.addEventListener( 'click', () => {
					startLoginFlow();

					const metadata = convertFormDataToObject( new FormData( form ), [
						'email',
						'_wp_http_referer',
						'newspack_reader_registration',
					] );
					metadata.current_page_url = window.location.href;
					const checkLoginStatus = () => {
						fetch(
							`/wp-json/newspack/v1/login/google/register?metadata=${ JSON.stringify( metadata ) }`
						).then( res => {
							res.json().then( ( { message, data } ) => endLoginFlow( message, res.status, data ) );
						} );
					};
					fetch( '/wp-json/newspack/v1/login/google' )
						.then( res =>
							res.json().then( data => Promise.resolve( { data, status: res.status } ) )
						)
						.then( ( { data, status } ) => {
							if ( status !== 200 ) {
								endLoginFlow( data.message, status );
							} else {
								const authWindow = window.open(
									'about:blank',
									'newspack_google_login',
									'width=500,height=600'
								);
								if ( authWindow ) {
									authWindow.location = data;
									const interval = setInterval( () => {
										if ( authWindow.closed ) {
											checkLoginStatus();
											clearInterval( interval );
										}
									}, 500 );
								} else {
									endLoginFlow();
								}
							}
						} );
				} );
			}
		} );
	} );
} )( window.newspackReaderActivation );