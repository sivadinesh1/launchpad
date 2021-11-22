import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class VersionCheckService {
    // this will be replaced by actual hash post-build.js
    private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';

    constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

    /**
     * Checks in every set frequency the version of frontend application
     *
     * @param url
     * @param frequency - in milliseconds, defaults to 30 minutes
     */
    public initVersionCheck(url, frequency = 1000 * 60 * 5) {
        setInterval(() => {
            this.checkVersion(url);
        }, frequency);
    }

    /**
     * Will do the call and check if the hash has changed or not
     *
     * @param url
     */
    checkVersion(url) {
        // timestamp these requests to invalidate caches
        this.http
            .get(url + '?t=' + new Date().getTime())

            .subscribe(
                (response: any) => {
                    const hash = response.hash;
                    const hashChanged = this.hasHashChanged(
                        this.currentHash,
                        hash
                    );

                    // If new version, do something
                    if (hashChanged) {
                        console.log(
                            'dinesh version check .. Yes, version changed'
                        );
                        // ENTER YOUR CODE TO DO SOMETHING UPON VERSION CHANGE
                        // for an example: location.reload();
                        location.reload();
                    }
                    // store the new hash so we wouldn't trigger versionChange again
                    // only necessary in case you did not force refresh
                    this.currentHash = hash;
                },
                (err) => {
                    console.error(err, 'Could not get version');
                }
            );
    }

    /**
     * Checks if hash has changed.
     * This file has the JS hash, if it is a different one than in the version.json
     * we are dealing with version change
     *
     * @param currentHash
     * @param newHash
     * @returns
     */
    hasHashChanged(currentHash, newHash) {
        if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
            return false;
        }

        return currentHash !== newHash;
    }

    openSnackBar(message: string, action: string) {
        const snackBarRef = this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });

        snackBarRef.afterDismissed().subscribe(() => {
            console.log('The snackbar was dismissed. Shall v reload!!');
        });
    }
}
