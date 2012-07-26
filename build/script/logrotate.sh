#!/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

declare -r __PWD__=$(pwd)
declare -r APPROOT=$(cd -- $(dirname -- ${0}) && cd .. && pwd)

# {{{ function usage() #
usage() {
    echo "${0} log-directory"
}
# }}} #

if [ ${#} -lt 1 ] ; then
    usage
    exit 1
fi

declare -r LOGROOT=$(readlink -f -- "${1}")
declare -r LOGDATE=$(date -d"-1day" +"%Y%m%d")

if [ ! -d "${LOGROOT}" ] ; then
    echo "LOG.ROOT (${LOGROOT}) not found."
    exit 2
fi

if [ ! -d "${LOGROOT}/${LOGDATE}" ] ; then
    mkdir -p "${LOGROOT}/${LOGDATE}"
fi

if [ ! -d "${LOGROOT}/${LOGDATE}" ] ; then
    exit 3
fi

for _file in $(find -- "${LOGROOT}" -maxdepth 1 -type f -name "*.log") ; do
    mv -f "${_file}" "${LOGROOT}/${LOGDATE}/"
done

cd "${APPROOT}" && ./bin/appctl reload && cd "${LOGROOT}/${LOGDATE}"
if [ ${?} -ne 0 ] ; then
    exit 4
fi

for _file in $(find . -type f | grep -v -E "\.tar\.gz$") ; do
    if [ $(file -- "${_file}" | grep -c -w "gzip") -gt 0 ] ; then
        continue
    fi
    tar cvzf "${_file}.${LOGDATE}.tar.gz" ${_file} && rm -f ${_file}
done

cd "${__PWD__}"
exit 0
