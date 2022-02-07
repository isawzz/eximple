def arrTrim(arr):
	arr1=[]
	for a in arr:
		if len(a) > 0: arr1.append(a)
	return arr1

def sep_stripped(s,sep=','):
	arr = s.split(',')
	arr =  arrTrim(arr)
	return [x.strip() for x in arr]

def string_to_arr(s,sep=', '):
	return sep_stripped(s,sep)

def arr_to_string(arr,sep=', '):
	arr = arrTrim(arr)
	return sep.join(arr)

def addif(arr,el):
	if not el in arr:
		arr.append(el)

